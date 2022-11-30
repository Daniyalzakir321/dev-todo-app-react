import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, IconButton, InputAdornment } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import Swal from "sweetalert2";
import "./Signup.css";
import AOS from "aos";
import "aos/dist/aos.css";
import firebase from "firebase/compat/app";
import { storage, auth } from "../../Firebase/Firebase";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useFormik } from "formik";
import * as Yup from "yup";

function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/todos", { replace: true });
      window.history.replaceState(null, null, `/todos`);
    }
    AOS.init({ once: true });
  }, []);

  // Google Login
  const GoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    signInWithPopup(auth, provider).then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const { displayName, email, photoURL } = result.user;
      if (result) {
        localStorage.setItem("token", JSON.stringify(result.user));
        storage.collection("Users").doc().collection(email).add({
          UserName: displayName,
          UserEmail: email,
          UserPhoto: photoURL,
          UserToken: credential.accessToken,
          TimeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        });
        setTimeout(() => {
          navigate("/todos");
        }, 1000);
      }
    });
  };

  // Formik Yup Input Validation
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Should be 8 characters minimum.")
      .max(31, "Can not be more then 30 characters."),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values, actions) => {
      const { email, password } = values;
      // SignUp with Email and Pass
      await auth
        .createUserWithEmailAndPassword(email, password)
        .then(async (result) => {
          Swal.fire({
            title: "SignUp Successfull!",
            icon: "success",
            focusConfirm: true,
            confirmButtonText: " OK ",
            timer: 3000,
          });

          if (result) {
            await storage
              .collection("Users")
              .doc()
              .collection(result.user.email)
              .add({
                UserName: result.user.displayName,
                UserEmail: result.user.email,
                UserPhoto: result.user.photoURL,
                UserToken: "null",
                TimeStamp: firebase.firestore.FieldValue.serverTimestamp(),
              });
            setTimeout(() => {
              navigate("/login");
            }, 1000);
            auth.signOut();
          }
          // Reset Form
          actions.resetForm();
        })
        .catch((error) => {
          console.log(error.message);
          Swal.fire({
            icon: "error",
            position: "top-end",
            title: "Error",
            text: error.message,
            showConfirmButton: true,
            timer: 3000,
          });
        });
    },
  });

  return (
    <div className="row g-0 auth-wrapper">
      <div className="col-12 col-md-5 col-lg-6 h-100 auth-background-col">
        <div className="auth-background-mask">
          <div
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-easing="ease-in-out"
          >
            <h1>Welcome to </h1>
            <h3>Todo List App</h3>
          </div>
        </div>
      </div>

      <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center">
        <div className="d-flex flex-column align-content-end rigister-form-scroll">
          <div className="auth-body mx-auto">
            <Link to="/login">
              <img
                src={
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHnsmZJ-Niz1IDI4zSkUkEqOsaxkbuWI3ajMUCXxiKJD8ra3w-tbSs34fyPEcNDh0A2Bc&usqp=CAU"
                }
              />
            </Link>
            <p>Sign Up</p>
            <div className="auth-form-container text-start">
              <form onSubmit={formik.handleSubmit} className="auth-form">
                <div className="mb-3">
                  <TextField
                    className="form-control"
                    size="small"
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email.toLowerCase()}
                    onChange={formik.handleChange}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                  />
                </div>

                <div className="mb-4">
                  <TextField
                    size="small"
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                  />
                </div>

                <div className="text-center">
                  <Button
                    variant="contained"
                    type="submit"
                    className="w-100 mb-2"
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="contained"
                    className="w-100 "
                    onClick={() => GoogleLogin()}
                  >
                    Google LogIn{" "}
                    <GoogleIcon sx={{ fontSize: 19, marginLeft: 1 }} />
                  </Button>
                </div>
              </form>
              <hr />
              <div className="auth-option text-center pt-2">
                Already have an account?{" "}
                <Link className="text-link" to="/login">
                  LogIn
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
