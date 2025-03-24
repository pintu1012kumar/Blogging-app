

import { signupInput} from "@pintu1012kumar/medium-common";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

type signupInput = {
  email: string;
  name: string;
  password: string;
};

 const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const [postInputs, setPostInputs] = useState<signupInput>({
    email: "",
    name: "",
    password: "",
  });

  const navigate = useNavigate();

  async function sendRequest() {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        { ...postInputs }
      );

      const jwt = response.data;
      localStorage.setItem("token", jwt);
      navigate("/blogs");
    } catch (e) {
      //
      alert("Error while signing up/in");
    }
  }

  return (
    <div className="h-screen flex justify-center items-center flex-col">
      <div className="text-3xl font-extrabold">Create an account</div>
      <div className="text-l font-normal text-slate-400">
        {type === "signin"
          ? "Don't have an account? "
          : "Already have an account? "}
        <Link
          to={type === "signin" ? "/signup" : "/signin"}
          className="text-blue-500 underline"
        >
          {type === "signin" ? "Sign up" : "Log in"}
        </Link>
      </div>
      <LabelInput
        label="Name"
        placeholder="Pintu.."
        onChange={(e) => {
          setPostInputs((prev) => {
            return { ...prev, name: e.target.value };
          });
        }}
      />
      <LabelInput
        label="email"
        placeholder="pintu@gmail.com"
        onChange={(e) => {
          setPostInputs((prev) => {
            return { ...prev, email: e.target.value };
          });
        }}
      />
      <LabelInput
        label="Password"
        type="password"
        placeholder="password"
        onChange={(e) => {
          setPostInputs((prev) => {
            return { ...prev, password: e.target.value };
          });
        }}
      />
      <button
        type="button"
        onClick={sendRequest}
        className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mt-3 w-1/2"
      >
        {type === "signin" ? "Sign in" : "Sign up"}
      </button>
    </div>
  );
};

interface LabelInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function LabelInput({ label, placeholder, onChange, type }: LabelInputType) {
  return (
    <div className="my-2 w-1/2">
      <label className="block mb-1 text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        type={type ?? "text"}
        id="first_name"
        onChange={onChange}
        className="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        placeholder={placeholder}
        required
      />
    </div>
  );
}

export default Auth
