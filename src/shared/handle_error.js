import swal from "sweetalert";

export function showErrorMessage(err, props) {
  var errText = "";
  if (err.data) {
    if (localStorage.getItem("admin_token")) {
      errText = err.data.message
        ? JSON.stringify(err.data.message)
        : err.data.errors
        ? JSON.stringify(err.data.errors)
        : "";
    }
    // else {
    //   // errText = err.data.message ? JSON.stringify(err.data.message) : (err.data.errors ? JSON.stringify(err.data.errors) : "")
    //   errText = "something went wrong";
    // }
    swal({
      closeOnClickOutside: false,
      title: "Error",
      text: errText,
      icon: "error",
    }).then(() => {
      if (localStorage.getItem("admin_token")) {
        if (err.data.status === 5) {
          localStorage.removeItem("admin_token");
        }
        //props.history.push('/admin');
        window.location.href = "/";
      } else {
        //props.history.push('/');
        window.location.href = "/";
      }
    });
    if (err.status === 500) {
      
      swal({
        closeOnClickOutside: false,
        title: "Error",
        text: "Internal Server Error! Please wait for some time.",
        icon: "error",
      });
    }
  } else {
    swal({
      closeOnClickOutside: false,
      title: "Error",
      text: "Internal Server Error! Please wait for some time.",
      icon: "error",
    }).then(() => {});
  }
}
