import React, { useState } from "react";
import axios from "axios";
import LoginForm from "./loginForm";
import { useSelector, useDispatch } from "react-redux";
import { setUserAndToken } from "./redux/loginSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const token = useSelector(state => state.login.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const uuid =
    "79185788-882b-47db-b355-91a0a2ed9339__Chrome__false__Apple Mac__OS X";

  async function submitLogin() {
    try {
      const response = await axios.post(
        "https://syjyg7izf3.execute-api.ap-southeast-1.amazonaws.com/Login/LoginUser",
        {
          email,
          password,
          uuid,
          brandID: 1,
        },
      );
      if (response.data) {
        let brandID = response.data.brandId || response.data.brandID;
        let campusID = response.data.campusId || response.data.campusID;
        let userId = response.data.id || response.data.userId;

        const reqOtpResponse = await axios.post(
          "https://syjyg7izf3.execute-api.ap-southeast-1.amazonaws.com/Login/SendLoginOtp",
          {
            brandID: brandID.toString(),
            campusID: campusID.toString(),
            isEmail: true,
            userId: userId.toString(),
            userName: response.data.userName,
          },
        );
        if (reqOtpResponse.data) {
          const verifyOtpResponse = await axios.post(
            "https://syjyg7izf3.execute-api.ap-southeast-1.amazonaws.com/Login/VerifyLoginUserOPT",
            {
              brandID: reqOtpResponse.data.brandID,
              campusID: reqOtpResponse.data.campusID,
              userId: reqOtpResponse.data.userId,
              userName: reqOtpResponse.data.userName,
              loginOpt: reqOtpResponse.data.loginOpt,
              uuid,
            },
          );
          dispatch(setUserAndToken(verifyOtpResponse.data));
          navigate("/home");
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <div>
      <LoginForm
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        submitLogin={submitLogin}
      />
    </div>
  );
}

export default Login;
