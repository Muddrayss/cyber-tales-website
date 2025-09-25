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
  const loadDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    try {
      const tmp = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      tmp.getTracks().forEach((t) => t.stop());
    } catch (e) {
      // continua comunque
    }

    const devs = await BrowserQRCodeReader.listVideoInputDevices();
    setDevices(devs);
    const pick = pickBackCamera(devs);
    setSelectedDeviceId(pick || null);
    return devs;
  }, []);

  useEffect(() => {
    const handler = () => loadDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', handler);
    return () =>
      navigator.mediaDevices?.removeEventListener?.('devicechange', handler);
  }, [loadDevices]);

  useEffect(() => {
    if (!cameraOn) return;
    (async () => {
      stopScan();
      setTimeout(() => {
        startScan();
      }, 50);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeviceId]);

  // avvia scanning
  const startScan = useCallback(async () => {
    if (cameraOn) return;
    setResult(null);
    if (!readerRef.current) readerRef.current = new BrowserQRCodeReader();

    const devs = await loadDevices();
    let devId = selectedDeviceId || pickBackCamera(devs);

    try {
      let controls: IScannerControls | null = null;

      if (devId) {
        controls = await readerRef.current.decodeFromVideoDevice(
          devId,
          videoRef.current!,
          async (res, _, contr) => {
            if (!res) return;
            const text = res.getText();
            contr.stop();
            setCameraOn(false);
            const tok = extractToken(text);
            if (!tok) return setResult({ ok: false, error: 'QR non valido' });
            setLastToken(tok);
            setLoading(true);
            const pr = await previewToken(tok, staffKey);
            setResult(pr);
            setLoading(false);
          }
        );
      } else {
        controls = await readerRef.current.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current!,
          async (res, _, contr) => {
            if (!res) return;
            const text = res.getText();
            contr.stop();
            setCameraOn(false);
            const tok = extractToken(text);
            if (!tok) return setResult({ ok: false, error: 'QR non valido' });
            setLastToken(tok);
            setLoading(true);
            const pr = await previewToken(tok, staffKey);
            setResult(pr);
            setLoading(false);
          }
        );
      }

      await videoRef.current?.play();

      controlsRef.current = controls;
      setCameraOn(true);
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (/permission|denied/i.test(msg)) {
        alert(
          "Permesso fotocamera negato. Tocca l'icona del lucchetto nella barra dell'URL e abilita la camera per questo sito."
        );
      } else if (/notallowederror|notfounderror|overconstrained/i.test(msg)) {
        alert(
          'Nessuna camera disponibile o bloccata dalle policy del browser/origine.'
        );
      } else {
        alert('Errore apertura camera: ' + msg);
      }
      setCameraOn(false);
    }
  }, [cameraOn, staffKey, selectedDeviceId, loadDevices]);

  const stopScan = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setCameraOn(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopScan(), [stopScan]);

  useEffect(() => {
    if (result) {
      // Wait for DOM to update
      setTimeout(() => {
        const resultElement = document.getElementById('result-section');
        if (resultElement) {
          resultElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 100);
    }
  }, [result]);

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
          error: "Impossibile leggere il QR dall'immagine",
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
      <div className='min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'>
        <div className='w-full max-w-md'>
          {/* Glass card con sfondo sfumato */}
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl'></div>
            <div className='relative bg-slate-800/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50'>
              <div className='text-center mb-8'>
                <div className='inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-purple-500/20 mb-4'>
                  <svg
                    className='w-8 h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
                <h1 className='text-3xl font-bold text-white mb-2'>
                  Staff Access
                </h1>
                <p className='text-slate-400 text-sm'>
                  Inserisci le tue credenziali per accedere
                </p>
              </div>

              <div className='space-y-4'>
                <div>
                  <input
                    type='password'
                    className='w-full px-4 py-3 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all'
                    placeholder='Password staff'
                    value={staffKey}
                    onChange={(e) => setStaffKey(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && doLogin()}
                  />
                  {loginErr && (
                    <p className='text-red-400 text-sm mt-2 flex items-center gap-1'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      {loginErr}
                    </p>
                  )}
                </div>

                <button
                  onClick={doLogin}
                  className='w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl'
                >
                  Accedi
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-8'>
      <div
        className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
        style={{ paddingTop: navbarHeight + 24 }}
      >
        {/* Header migliorato */}
        <header className='mb-8'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
            <div>
              <h1 className='text-3xl sm:text-4xl font-bold text-white mb-2'>
                QR Scanner
              </h1>
              <p className='text-slate-400'>
                Sistema di validazione ticket staff
              </p>
            </div>

            <div className='flex flex-wrap gap-3'>
              {devices.length > 0 && (
                <select
                  className='px-4 py-2.5 bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 text-white focus:border-blue-500/50 focus:outline-none transition-all'
                  value={selectedDeviceId || ''}
                  onChange={(e) => setSelectedDeviceId(e.target.value || null)}
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={doLogout}
                className='px-4 py-2.5 bg-slate-800/50 backdrop-blur rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center gap-2'
              >
                <svg
                  className='w-5 h-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                <span className='hidden sm:inline'>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className='grid lg:grid-cols-2 gap-6'>
          {/* Colonna sinistra - Scanner */}
          <div className='space-y-6'>
            {/* Camera Section */}
            <div className='bg-slate-800/30 backdrop-blur rounded-2xl border border-slate-700/50 overflow-hidden'>
              <div className='aspect-[4/3] relative bg-slate-950'>
                <video
                  ref={videoRef}
                  className='w-full h-full object-cover'
                  muted
                  playsInline
                  autoPlay
                />
                {!cameraOn && (
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-center'>
                      <svg
                        className='w-16 h-16 text-slate-600 mx-auto mb-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1.5}
                          d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 001 1h2m-5 0V4m0 0L9 4m3 0l3 0'
                        />
                      </svg>
                      <p className='text-slate-500 mb-4'>Camera non attiva</p>
                      <button
                        onClick={startScan}
                        className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl'
                      >
                        Attiva Scanner
                      </button>
                    </div>
                  </div>
                )}
                {cameraOn && (
                  <button
                    onClick={stopScan}
                    className='absolute top-4 right-4 px-4 py-2 bg-red-500/90 backdrop-blur text-white rounded-lg hover:bg-red-600 transition-all flex items-center gap-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                    Chiudi
                  </button>
                )}
              </div>
            </div>

            {/* Input Alternativo */}
            <div className='bg-slate-800/30 backdrop-blur rounded-2xl border border-slate-700/50 p-6'>
              <h3 className='text-white font-semibold mb-4 flex items-center gap-2'>
                <svg
                  className='w-5 h-5 text-slate-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                Inserimento Manuale
              </h3>

              <div className='space-y-4'>
                <textarea
                  className='w-full h-24 p-3 rounded-xl bg-slate-900/50 text-white placeholder-slate-500 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none'
                  placeholder='Incolla qui il token o il JSON del QR {"t":"..."}'
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                />

                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    onClick={doPreviewManual}
                    className='flex-1 px-4 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700/70 transition-all flex items-center justify-center gap-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                    Preview
                  </button>

                  <label className='flex-1 px-4 py-2.5 bg-slate-700/50 text-white rounded-xl hover:bg-slate-700/70 transition-all flex items-center justify-center gap-2 cursor-pointer'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                    Carica Immagine
                    <input
                      type='file'
                      accept='image/*'
                      capture='environment'
                      className='hidden'
                      onChange={onUploadImage}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Colonna destra - Risultati */}
          <div
            className='bg-slate-800/30 backdrop-blur rounded-2xl border border-slate-700/50 p-6'
            id='result-section'
          >
            <h3 className='text-white font-semibold mb-4 flex items-center gap-2'>
              <svg
                className='w-5 h-5 text-slate-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
              Risultati Validazione
            </h3>

            {loading && (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4'></div>
                  <p className='text-slate-400'>Verifica in corso...</p>
                </div>
              </div>
            )}

            {!loading &&
              result &&
              (result.ok ? (
                <div className='space-y-6'>
                  {/* Status Badge */}
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-slate-400'>Modalità</span>
                    <span className='px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium'>
                      Preview
                    </span>
                  </div>

                  {/* Score Info */}
                  {result.score && (
                    <div className='space-y-4'>
                      <div className='bg-slate-900/50 rounded-xl p-4 space-y-3'>
                        <h4 className='text-white font-medium mb-3'>
                          Informazioni Ticket
                        </h4>

                        <div className='grid gap-3'>
                          <div className='flex justify-between items-center py-2 border-b border-slate-700/50'>
                            <span className='text-slate-400 text-sm'>
                              Email
                            </span>
                            <span className='text-white text-sm font-medium'>
                              {result.score.email}
                            </span>
                          </div>
                          <div className='flex justify-between items-center py-2 border-b border-slate-700/50'>
                            <span className='text-slate-400 text-sm'>
                              Gioco
                            </span>
                            <span className='text-white text-sm font-medium'>
                              {result.score.game}
                            </span>
                          </div>
                          <div className='flex justify-between items-center py-2 border-b border-slate-700/50'>
                            <span className='text-slate-400 text-sm'>
                              Difficoltà
                            </span>
                            <span className='text-white text-sm font-medium'>
                              {result.score.difficulty}
                            </span>
                          </div>
                          <div className='flex justify-between items-center py-2 border-b border-slate-700/50'>
                            <span className='text-slate-400 text-sm'>
                              Punteggio
                            </span>
                            <span className='text-white text-sm font-medium'>
                              {result.score.score}
                            </span>
                          </div>
                          <div className='flex justify-between items-center py-2'>
                            <span className='text-slate-400 text-sm'>
                              Stato
                            </span>
                            {result.score.redeemed ? (
                              <span className='px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium'>
                                Già Riscattato
                              </span>
                            ) : (
                              <span className='px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium'>
                                Disponibile
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Player Info */}
                      {result.player && (
                        <div className='bg-slate-900/50 rounded-xl p-4'>
                          <h4 className='text-white font-medium mb-3'>
                            Statistiche Giocatore
                          </h4>
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='text-center'>
                              <p className='text-2xl font-bold text-white'>
                                {result.player.submit_count}
                              </p>
                              <p className='text-xs text-slate-400'>
                                Partite Giocate
                              </p>
                            </div>
                            <div className='text-center'>
                              <p className='text-2xl font-bold text-white'>
                                {result.player.redeem_count}
                              </p>
                              <p className='text-xs text-slate-400'>
                                Premi Riscattati
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      {result.score && !result.score.redeemed && lastToken && (
                        <button
                          onClick={onRedeem}
                          className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2'
                        >
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          Conferma Riscatto
                        </button>
                      )}

                      {result.score && result.score.redeemed && (
                        <div className='bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4'>
                          <p className='text-yellow-400 text-sm flex items-center gap-2'>
                            <svg
                              className='w-5 h-5'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                              />
                            </svg>
                            Questo ticket è già stato riscattato
                          </p>
                          {result.score.redeemed_at && (
                            <p className='text-slate-500 text-xs mt-2'>
                              Riscattato il:{' '}
                              {new Date(
                                result.score.redeemed_at
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className='bg-red-500/10 border border-red-500/30 rounded-xl p-4'>
                  <p className='text-red-400 flex items-center gap-2'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    {result.error || 'Errore sconosciuto'}
                  </p>
                </div>
              ))}

            {!loading && !result && (
              <div className='flex items-center justify-center py-12'>
                <div className='text-center'>
                  <svg
                    className='w-16 h-16 text-slate-600 mx-auto mb-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={1.5}
                      d='M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 001 1h2m-5 0V4m0 0L9 4m3 0l3 0'
                    />
                  </svg>
                  <p className='text-slate-500 mb-2'>Nessun QR scansionato</p>
                  <p className='text-slate-600 text-sm'>
                    Usa lo scanner, carica un'immagine o incolla un token
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffScanner;
