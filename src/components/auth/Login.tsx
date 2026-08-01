import React from "react";
import FormLoader from "./FormLoader";
import LoginForm from "./LoginForm";

const Login = () => {
  return (
    <div>
      <FormLoader label="login">
       <div className="max-h-[400px]">
         <LoginForm />
       </div>
      </FormLoader>
    </div>
  );
};

export default Login;
