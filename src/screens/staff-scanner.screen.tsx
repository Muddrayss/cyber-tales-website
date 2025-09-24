import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from 'react';
import {
  verifyStaffKey,
  previewToken,
  redeemToken,
  type ScanResult,
} from '@utils/staff.api';
import { BrowserQRCodeReader, IScannerControls } from '@zxing/browser';

// contexts
import { NavbarContext } from '@contexts/navbar.context';

const LS_KEY = 'Xor55@';

function pickBackCamera(devs: MediaDeviceInfo[]): string | null {
  // scegli "back"/"rear" se presente, altrimenti la prima
  const lower = devs.map((d) => ({ d, name: (d.label || '').toLowerCase() }));
  const back = lower.find(
    (x) => x.name.includes('back') || x.name.includes('rear')
  );
  return back?.d?.deviceId || devs[0]?.deviceId || null;
}

function extractToken(raw: string): string | null {
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && obj.t) return String(obj.t);
  } catch {
    if (raw && raw.length >= 10) return raw.trim();
  }
  return null;
}

const StaffScanner: React.FC = () => {
  const { navbarHeight } = useContext(NavbarContext);

  // auth
  const [authed, setAuthed] = useState(false);
  const [staffKey, setStaffKey] = useState('');
  const [loginErr, setLoginErr] = useState<string | null>(null);

  // scan state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastToken, setLastToken] = useState<string | null>(null);

  // camera / zxing
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  // al mount, se ho già una chiave, riprovo a verificarla
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;
    setStaffKey(saved);
    verifyStaffKey(saved).then((r) => {
      if (r.ok) setAuthed(true);
      else localStorage.removeItem(LS_KEY);
    });
  }, []);

  const doLogin = useCallback(async () => {
    setLoginErr(null);
    if (!staffKey) {
      setLoginErr('Inserisci la password staff');
      return;
    }
    const r = await verifyStaffKey(staffKey);
    if (!r.ok) {
      setLoginErr('Password errata');
      return;
    }
    localStorage.setItem(LS_KEY, staffKey);
    setAuthed(true);
  }, [staffKey]);

  const doLogout = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    setStaffKey('');
    setAuthed(false);
  }, []);

  // carica lista device video
  const loadDevices = useCallback(async () => {
    const devs = await BrowserQRCodeReader.listVideoInputDevices();
    setDevices(devs);
    const pick = pickBackCamera(devs);
    setSelectedDeviceId(pick);
  }, []);

  // avvia scanning
  const startScan = useCallback(async () => {
    if (cameraOn) return;
    setResult(null);
    if (!readerRef.current) readerRef.current = new BrowserQRCodeReader();

    await loadDevices();
    const devId = selectedDeviceId || pickBackCamera(devices);
    if (!devId) {
      alert('Nessuna camera disponibile');
      return;
    }

    const controls = await readerRef.current.decodeFromVideoDevice(
      devId,
      videoRef.current!,
      async (res, _, contr) => {
        if (res) {
          const text = res.getText();
          contr.stop();
          setCameraOn(false);
          const tok = extractToken(text);
          if (!tok) {
            setResult({ ok: false, error: 'QR non valido' });
            return;
          }
          setLastToken(tok);
          setLoading(true);
          const pr = await previewToken(tok, staffKey);
          setResult(pr);
          setLoading(false);
        }
      }
    );
    controlsRef.current = controls;
    setCameraOn(true);
  }, [cameraOn, staffKey, devices, selectedDeviceId, loadDevices]);

  const stopScan = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopScan(), [stopScan]);

  // preview manuale (incolla)
  const [tokenInput, setTokenInput] = useState('');
  const doPreviewManual = useCallback(async () => {
    const tok = extractToken(tokenInput);
    if (!tok) {
      setResult({ ok: false, error: 'Token/QR non valido' });
      return;
    }
    setLastToken(tok);
    setLoading(true);
    const pr = await previewToken(tok, staffKey);
    setResult(pr);
    setLoading(false);
  }, [tokenInput, staffKey]);

  // fallback: upload immagine contenente QR
  const onUploadImage = useCallback(
    async (ev: React.ChangeEvent<HTMLInputElement>) => {
      const file = ev.target.files?.[0];
      if (!file) return;
      // ZXing ha anche decodeFromImageUrl, ma qui decodifichiamo lato video: per semplicità
      // creiamo un oggetto URL e usiamo decodeFromImageUrl()
      try {
        if (!readerRef.current) readerRef.current = new BrowserQRCodeReader();
        const url = URL.createObjectURL(file);
        const res = await readerRef.current.decodeFromImageUrl(url);
        URL.revokeObjectURL(url);
        const text = res.getText();
        const tok = extractToken(text);
        if (!tok) {
          setResult({ ok: false, error: 'QR non valido' });
          return;
        }
        setLastToken(tok);
        setLoading(true);
        const pr = await previewToken(tok, staffKey);
        setResult(pr);
        setLoading(false);
      } catch {
        setResult({
          ok: false,
          error: 'Impossibile leggere il QR dall’immagine',
        });
      }
    },
    [staffKey]
  );

  const onRedeem = useCallback(async () => {
    if (!lastToken) return;
    setLoading(true);
    const rd = await redeemToken(lastToken, staffKey);
    setResult(rd);
    setLoading(false);
  }, [lastToken, staffKey]);

  if (!authed) {
    return (
      <div className='min-h-screen flex items-center justify-center p-6 bg-slate-900'>
        <div className='w-full max-w-sm bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10'>
          <h1 className='text-white text-2xl font-bold mb-4'>Staff Login</h1>
          <input
            type='password'
            className='w-full px-3 py-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20 mb-2'
            placeholder='Password staff'
            value={staffKey}
            onChange={(e) => setStaffKey(e.target.value)}
          />
          {loginErr && <p className='text-red-400 text-sm mb-2'>{loginErr}</p>}
          <button
            onClick={doLogin}
            className='w-full py-2 rounded bg-emerald-500 text-white font-semibold hover:bg-emerald-600'
          >
            Entra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen p-6 bg-slate-900 text-white'>
      <div
        className='max-w-3xl mx-auto space-y-6'
        style={{ marginTop: navbarHeight }}
      >
        <header className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold'>Staff Scanner</h1>
          <div className='flex gap-3 items-center'>
            {devices.length > 0 && (
              <select
                className='px-2 py-1 bg-white/10 rounded border border-white/20'
                value={selectedDeviceId || ''}
                onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || d.deviceId.slice(0, 8)}
                  </option>
                ))}
              </select>
            )}
            {!cameraOn ? (
              <button
                onClick={startScan}
                className='px-3 py-2 bg-cyan-500 rounded hover:bg-cyan-600'
              >
                Apri Camera
              </button>
            ) : (
              <button
                onClick={stopScan}
                className='px-3 py-2 bg-yellow-500 rounded hover:bg-yellow-600'
              >
                Chiudi Camera
              </button>
            )}
            <button
              onClick={doLogout}
              className='px-3 py-2 bg-red-500 rounded hover:bg-red-600'
            >
              Logout
            </button>
          </div>
        </header>

        <section className='bg-white/5 rounded-2xl p-4 border border-white/10'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1 space-y-3'>
              <div className='flex gap-2'>
                <button
                  onClick={doPreviewManual}
                  className='px-3 py-2 bg-emerald-500 rounded hover:bg-emerald-600'
                >
                  Preview manuale
                </button>
                <label className='px-3 py-2 bg-indigo-500 rounded hover:bg-indigo-600 cursor-pointer'>
                  Carica immagine QR
                  <input
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={onUploadImage}
                  />
                </label>
              </div>
              <textarea
                className='w-full h-24 p-2 rounded bg-white/10 text-white placeholder-white/50 border border-white/20'
                placeholder='Incolla qui JSON del QR ({"t":"...token..."}) o direttamente il token'
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />
            </div>

            <div className='w-full md:w-80'>
              <video
                ref={videoRef}
                className='w-full rounded-lg border border-white/10'
                muted
                playsInline
              />
            </div>
          </div>
        </section>

        <section className='bg-white/5 rounded-2xl p-4 border border-white/10'>
          {loading && <p className='text-white/80'>Verifica in corso…</p>}
          {!loading &&
            result &&
            (result.ok ? (
              <div className='space-y-2'>
                <p className='text-white/80'>
                  Modalità: <span className='font-semibold'>preview</span>
                </p>
                {result.score && (
                  <div className='mt-2'>
                    <h3 className='font-semibold text-lg'>Score</h3>
                    <ul className='text-white/90 list-disc ml-5'>
                      <li>
                        <b>Email:</b> {result.score.email}
                      </li>
                      <li>
                        <b>Gioco:</b> {result.score.game}
                      </li>
                      <li>
                        <b>Difficoltà:</b> {result.score.difficulty}
                      </li>
                      <li>
                        <b>Punteggio:</b> {result.score.score}
                      </li>
                      <li>
                        <b>Redeemed:</b> {String(result.score.redeemed)}
                      </li>
                      <li>
                        <b>Redeemed at:</b> {result.score.redeemed_at ?? '—'}
                      </li>
                      <li>
                        <b>Creato:</b>{' '}
                        {new Date(result.score.created_at).toLocaleString()}
                      </li>
                    </ul>
                  </div>
                )}
                {result.player && (
                  <div className='mt-2'>
                    <h3 className='font-semibold text-lg'>Player</h3>
                    <ul className='text-white/90 list-disc ml-5'>
                      <li>
                        <b>Email:</b> {result.player.email}
                      </li>
                      <li>
                        <b>Submit count:</b> {result.player.submit_count}
                      </li>
                      <li>
                        <b>Redeem count:</b> {result.player.redeem_count}
                      </li>
                      <li>
                        <b>Aggiornato:</b>{' '}
                        {new Date(result.player.updated_at).toLocaleString()}
                      </li>
                    </ul>
                  </div>
                )}
                {result.score && !result.score.redeemed && lastToken && (
                  <div className='pt-3'>
                    <button
                      onClick={onRedeem}
                      className='px-4 py-2 rounded bg-lime-500 hover:bg-lime-600 font-semibold'
                    >
                      REDEEM
                    </button>
                  </div>
                )}
                {result.score && result.score.redeemed && (
                  <p className='text-yellow-400 font-semibold mt-2'>
                    ⚠️ Già riscattato
                  </p>
                )}
              </div>
            ) : (
              <p className='text-red-400'>
                Errore: {result.error ?? 'Sconosciuto'}
              </p>
            ))}
          {!loading && !result && (
            <p className='text-white/60'>
              Scansiona un QR, carica un’immagine o incolla il token per la
              preview.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default StaffScanner;
