import {  faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Loader = () => {
  return (
    <div className='flex items-center justify-center  h-10 flex-col'>
      <FontAwesomeIcon icon={faEnvelope} bounce   style={{color: "rgb(255, 212, 59)",width:"35px",height:"40px"}} />
      <p className='font-mono'>Please Wait...</p>   
    </div>
  );
}

export default Loader;
