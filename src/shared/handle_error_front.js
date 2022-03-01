import swal from "sweetalert";

export function showErrorMessageFront(err,token_rm,props){
  var errText = err.data.message;
  swal({
    closeOnClickOutside: false,
    title: "Access Denied",
    text: errText,
    icon: "error"
  }).then(()=> {
      if(localStorage.getItem('token') && token_rm === 1){
          localStorage.removeItem('token')
          window.location.href="/";
      }else{
          window.location.href="/";
      }
  });
}

