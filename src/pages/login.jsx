import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import s from "@/styles/login.module.scss";

import { Patrick_Hand } from "next/font/google";
import { Amatic_SC } from "next/font/google";

const patrick = Patrick_Hand({
  weight: '400',
  subsets: ['latin']
});

const amatic = Amatic_SC({
  weight: '700',
  subsets: ['latin']
});


const Login = () => {
  const [error, setError] = useState("");
  const inputRef = useRef();
  const { push } = useRouter();

  const onKeyDown = (e) => {
    // detect when user press enter
    if (e.keyCode === 13) {
      localStorage.setItem("username", inputRef.current.value);
      inputRef.current.value = "";

      push("/");
    }
  };

  useEffect(() => {
    if (localStorage.getItem("error") == 200) {
      console.log("error is present");

      setError("serveur is down atm");
    }
  }, []);

  const displayError = () => {
    if (error !== "") {
      return <h2>error</h2>
    }
  }

  return (
    <div className={s.loginpage}>
      <h1 className={amatic.className}>Login Page</h1>
      <p className={patrick.className}>Enter username</p>
      <input
        ref={inputRef}
        className={`${s.loginput} ${patrick.className}`}
        type="text"
        placeholder="Zidane"
        onKeyDown={onKeyDown}
      />

      {displayError()}


    </div>
  );
};

export default Login;
