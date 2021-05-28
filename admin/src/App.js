import './App.css';
import firebase from 'firebase/app'
import 'firebase/auth'
import { AuthCheck, useAuth, useUser } from 'reactfire';
import axios from 'axios';
import { config } from './config';

function App() {

  const { data: user } = useUser();
  const reactAuth = useAuth();

  const signIn = async () => {
    await reactAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(result => {
      if (result.user) {
        firebase.auth().currentUser.getIdToken(false).then(idToken => {
          axios.post(`${config.apiUrl}/login/${result.user.uid}`, {
            displayName: result.user.displayName,
            email: result.user.email,
            authorization: idToken
          })
        })
      }
    });
  };

  const logUser = () => {
    console.log(user)
  }


  return (
    <div className="App">
      <AuthCheck fallback={<><h1 onClick={signIn}>Login</h1></>}>
   <h1>Signed in</h1>
      </AuthCheck>


    </div>
  );
}

export default App;
