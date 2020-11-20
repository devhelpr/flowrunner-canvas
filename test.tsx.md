import React from "react";
//import { useEffect, useState } from "react";
//import "./styles.css";
//import { Subject } from "rxjs";
//import { interval } from "rxjs";
//import { sample, throttle } from "rxjs/operators";

export default function App() {
  /*const [test, setTest] = useState("test");

  useEffect(() => {
    setTest("test");
  }, []);

  */
  /*
  let subject = new Subject();
  useEffect(() => {
    
    let subscribtion = subject.pipe(sample(interval(30))).subscribe({
      next: (data) => {
        setTest([...test, data])
      }
    });
    setTest(["start"]);
    subject.next("test1");
    subject.next("test2");
    let loop = 0;
    while (loop < 10000) {
      subject.next("test"+loop);
      loop++;
    }
    return () => {
      subscribtion.unsubscribe();
    };
  },[]);*/

  return (
    <div className="App">
      <h1>hello</h1>
    </div>
  );
}
