import Barcode from './BarcodeLogo';

const Header = () => {
  return (
     <div className="fixed top-0 left-0 right-0 z-50 h-[50px] max-w-[960px] 
                     mt-4 mx-[5%] lg:mx-auto rounded-full flex 
                     items-center justify-around bg-black/10 
                     backdrop-blur-lg border border-zinc-600/20 shadow-lg
                     text-white">
          <div className="logo">
               <h1 className="text-white text-lg lg:text-xl  font-bold">
                    nera *
               </h1>
               <Barcode />
          </div>
          <div>
               <ul className="flex items-center gap-2 text-sm">
                    <li>
                         <a href="#">Home</a>
                    </li>
                    <li>
                         <a href="#">About</a>
                    </li>
                    <li>
                         <a href="#">Contact</a>
                    </li>
               </ul>
          </div>
     </div>
  );
};

export default Header;