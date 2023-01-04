import NameInput from '../components/NameInput'
import { useGamePage } from './hooks/useGamePage';

const SignIn = ({setStart}) => {
    const { name, setName } = useGamePage();
    const handleStart = ()=>{
        setStart(true);
    }
    return(
        <>
            <NameInput me={name} setName={setName} onStart={handleStart}/>
        </>
    )
}
export default SignIn;