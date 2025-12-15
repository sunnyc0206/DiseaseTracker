import logoImage from '../assets/logo.png';

const Logo = ({ className = "w-10 h-10", showText = false, textClassName = "", removeBackground = false }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={`${className} relative overflow-hidden rounded-full`}>
        <img 
          src={logoImage}
          alt="WDT Logo"
          className={`w-full h-full object-contain ${removeBackground ? 'mix-blend-multiply dark:mix-blend-screen' : ''}`}
          style={removeBackground ? { filter: 'brightness(1.1) contrast(1.2)' } : {}}
        />
      </div>
      
      {showText && (
        <div className={textClassName}>
          <div className="font-bold text-xl leading-tight">WDT</div>
          {textClassName.includes('sm:block') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">World Disease Tracker</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo; 