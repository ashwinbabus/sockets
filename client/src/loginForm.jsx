import React from "react";

function LoginForm({ email, setEmail, password, setPassword, submitLogin }) {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-green-100">
      <div className="w-96 h-96 flex flex-col gap-7 items-center justify-center">
        <input
          className="p-2 rounded-md"
          type="text"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          className="p-2 rounded-md"
          type="text"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button onClick={submitLogin} className=" w-[193px] bg-white p-2 rounded-md " >Submit</button>
      </div>
    </div>
  );
}

export default LoginForm;
