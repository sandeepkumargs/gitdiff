import './App.css';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import ambLogo from '../src/assets/amb-logo.jpg';


const App = () => {

  return (
    <div className="content">
      <Card className="text-center p-4">
        <img src={ambLogo} alt="Ambiguity Checker" className="mx-auto mb-4 w-24 h-24 object-contain" />
        <h3 className="font-bold mb-2 text-lg">Ambiguity Killer</h3>
        <p className="text-gray-600 text-sm">Hunt down hidden enemies in your requirements and clear the path for a flawless project victory!</p>
        {/* <Button 
          label="Select" 
          className="p-button-sm p-button-rounded mt-4" 

        /> */}
      </Card>
    </div>
  );
};

export default App;
