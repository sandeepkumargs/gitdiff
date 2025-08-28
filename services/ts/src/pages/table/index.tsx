import { Button } from "primereact/button";
import { useState } from "react";
//@ts-ignore
export default function Table({setClicked}) {
    const [count, setCount] = useState(0)
    const handleButtonClick = ()=> {
        setCount(count+1)
        setClicked(count)
    }
    return (
        <>
            <Button label="Select" onClick={()=> {handleButtonClick()}} />
        </>
    )
}