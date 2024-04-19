type HomeSectionProps = {
  title: string;
  paragraph: string;
  src: string;
  alt: string;
  imagePosition: 'left' | 'right';
};

const HomeSection: React.FC<HomeSectionProps> = (props: HomeSectionProps) => {
  const { title, paragraph, src, alt, imagePosition } = props;

  const returnComponent =
    imagePosition === 'right' ? (
      <div className='rounded-md grid grid-cols-1 md:grid-cols-3 items-center gap-5'>
        <div className='md:col-start-1 md:col-end-3'>
          <h2 className='paragraph-title py-4'>{title}</h2>
          <p className='paragraph text-gray-200'>{paragraph}</p>
        </div>
        <div className='md:col-start-3 md:col-end-4'>
          <img src={src} alt={alt} className='rounded-md' />
        </div>
      </div>
    ) : (
      <div className='rounded-md grid grid-cols-1 md:grid-cols-3 items-center gap-5'>
        <div className='row-start-2 md:row-auto md:col-start-1 md:col-end-2'>
          <img src={src} alt={alt} className='rounded-md' />
        </div>
        <div className='row-start-1 md:row-auto md:col-start-2 md:col-end-4'>
          <h2 className='paragraph-title py-4'>{title}</h2>
          <p className='paragraph text-gray-200'>{paragraph}</p>
        </div>
      </div>
    );

  return returnComponent;
};

export default HomeSection;
