let n = document.getElementById("name");
let e = document.getElementById("email");
let i = document.getElementById("ip");

let api = "http://40.0.1.155:4040/api/v1";
async function pd() {
  let obj = {
    name: n.value,
    email: e.value,
    ip: i.value,
  };
  console.log("\n\t data : " + obj);
  console.log("\n\t data : " + JSON.stringify(obj, null, 2));
}
