import React from 'react'
import SRL from './SRL.png'
//import API from "./../../shared/API-EXPLICT";

const Logo = () => {

    // const [logo, setLogo] = useState({imgUrl: '', imgName: ''});

    // useEffect(() => {
    //     API.get('/feed/logo').then((res) => {
    //         setLogo({
    //             imgUrl: res.data.data[0].logo_link,
    //             imgName:  res.data.data[0].logo_name
    //         });
    //     }).catch(err => {
    //         console.log(err);
    //     })
    // } )

    return (
        <span className='logo'
          style={{
              //padding: '30px'
          }}
        >
            <img 
            src={SRL} 
             width="99.23"
             height="56"
             alt='SRL Logo'
            />
        </span>
    )
}

export default Logo
