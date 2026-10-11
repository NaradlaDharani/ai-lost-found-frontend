let api="http://40.0.1.155:4040/api";

async  function log(){
    let req=await fetch(api);
    // let res=await req.json();
    // console.log("\n\t response : "+JSON.stringify(res));
    let res=await req.text();
    console.log("\n\t response : "+res);
    let r=document.getElementById("o")
    r.textContent=res;
}

