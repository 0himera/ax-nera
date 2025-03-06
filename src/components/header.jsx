import Barcode from './BarcodeLogo';

const Header = () => {
  return (
     <div className="h-[50px] w-[960px] mt-4 mx-auto rounded-full flex items-center justify-around bg-black">
          <div className="logo">
               <h1 className="text-white text-xl font-bold">
                    nera *
               </h1>
               <Barcode />
          </div>
          <div className="text-white">
               <ul className="flex items-center gap-4">
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