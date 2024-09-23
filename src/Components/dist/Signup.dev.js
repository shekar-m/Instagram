// import React from 'react';
// import  { useState } from 'react';
// import axios from 'axios';
// import {useNavigate,Link} from "react-router-dom"
// import axiosInstance from './Interceptors/axiosInterceptor';
// function Signup() {
//     const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setfullName] = useState('');
//   const history=useNavigate() 
//   async function handleLogin(e) {
//     e.preventDefault();
//     try{
//       await axiosInstance.post("/Signup",{
//         fullName,username,password
//       })
//       .then(res=>
//         {
//           console.log("result is here"+res.data)
//             if(res.data =="exist")
//             {
//                 alert("user already exists please login with with credintials")
//             }
//             else if(res.data =="not exist")
//             {
//                 history("/",{state:{id:username}})
//             }
//         })
//     }
//     catch(e)
//     {
//       console.log(e)
//     }  
//   };
//   return (
//     <div className="login-page">
//       <div className="login-form">
//         <h2 className='text-primary'>Signup</h2>
//         <form onSubmit={handleLogin}>
//         <div className="form-group">           
//             <input
//               type="text"
//               id="fullName"
//               value={fullName}
//               placeholder='Please enter your FullName'
//               onChange={(e) => setfullName(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             {/* <label htmlFor="username" className=''>Username:</label> */}
//             <input 
//             className="input-group input-group-lg"
//               type="text"
//               id="username"
//               value={username}
//               placeholder='Please enter your username'
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div className="form-group">
//             <input
//               type="password"
//               id="password"
//               value={password}
//               placeholder='Please enter your password'
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit">Sign up</button>
//           <br/>
//             <p>OR</p>
//           <br/>
//           <Link to="/">Login page </Link> 
//         </form>
//       </div>
//     </div>
//   );
// }
// export default Signup;
"use strict";