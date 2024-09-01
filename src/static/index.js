function globalScan(){
  var names = ["docname", "surname", "groupname", "id"];
  var regexp = [/^[\p{L}\s\/,\-]+$/u, /^[\p{L}]+$/u, /^[\p{L}\s\/,\-]+$/u, /^[\p{L}-]+$/u];
  var ready = true;
  for (let i = 0; i < names.length; i++){
    element = document.getElementsByName(names[i])[0];
    result = regexp[i].test(element.value)
    mark = element.nextElementSibling;
    if (result){
      mark.innerText = "✓";
      mark.classList.add("success");
      mark.classList.remove("error");
    }
    else{
      mark.innerText = "✕";
      mark.classList.add("error");
      mark.classList.remove("success");
      ready = false;
    }
  }
  document.getElementsByName("button")[0].disabled = !ready;
}

function onTextInput(field) {
  field.value = field.value.toUpperCase();
  globalScan();
}
