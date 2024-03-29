import { useState } from "react";
import axios from "axios";
import { get_base_api_url } from "../../util/util";
export default function Signup() {
  const [values, setValues] = useState({
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [messageStyle, setMessageStyle] = useState("");
  const handleInputChange = (e) => {
    //const name = e.target.name
    //const value = e.target.value
    const { name, value } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const handleSignup = (e) => {
    e.preventDefault();

    let validationFailed = false;

    for (const [key, value] of Object.entries(values)) {
      if (value == "") {
        console.log("Validation failed. Please enter a value for ", key);
        validationFailed = true;
      }
    }

    if (values.password != values.confirmPassword) {
      console.log(
        "validation failed. pasword and confirmpassword do not match"
      );
      validationFailed = true;
    }
    if (validationFailed) return;

    axios
      .post(get_base_api_url("user") + "/users/signup", values)
      .then((res) => {
        console.log("response is", res);
        console.log("data is ", res.data);
        const user = res.data[0];
        if (res.status === 200) {
          setMessage("User " + res.data.username + " registered successfully");
          setMessageStyle("success");
        } else {
          setMessage("User registration failed");
          setMessageStyle("failure");
        }
      })
      .catch((error) => {
        console.log("caught the signup error here ", error);
        setMessage("User registration failed");
        setMessageStyle("failure");
      });
    console.log("values is ", values);
  };

  return (
    <div className="registration form">
      <header>Signup</header>

      <form action="#">
        <span className={messageStyle}>{message}</span>

        <input
          type="text"
          name="username"
          onChange={handleInputChange}
          placeholder="Enter your email"
          value={values.username}
        />
        <input
          type="text"
          name="firstName"
          onChange={handleInputChange}
          placeholder="Enter your first name"
          value={values.firstName}
        />
        <input
          type="text"
          name="lastName"
          onChange={handleInputChange}
          placeholder="Enter your last name"
          value={values.lastName}
        />
        <input
          type="password"
          name="password"
          onChange={handleInputChange}
          placeholder="Create a password"
          value={values.password}
        />
        <input
          type="password"
          name="confirmPassword"
          onChange={handleInputChange}
          placeholder="Confirm your password"
          value={values.confirmPassword}
        />
        <input
          type="submit"
          className="button"
          value="Signup"
          onClick={handleSignup}
        />
      </form>
      <div className="signup">
        <span className="signup">
          Already have an account?
          <label for="check">Login</label>
        </span>
      </div>
    </div>
  );
}
