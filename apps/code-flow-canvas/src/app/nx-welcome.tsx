import { useEffect, useState } from "react";

export function NxWelcome({ title }: { title: string }) {
  const [ test , setTest] = useState("");
  
  useEffect(() => {
    fetch("/api/get-flows").then(_=>_.json()).then((data) => {
      setTest(JSON.stringify(data,null,2));
    });
  },[]);

  return (
    <>{test}</>
  );
}

export default NxWelcome;
