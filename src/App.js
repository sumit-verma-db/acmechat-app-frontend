// // routes
// import Router from "./routes";
// // theme
// import ThemeProvider from "./theme";
// // components
// import ThemeSettings from "./components/settings";
// import { AuthProvider } from "./hooks/useAuth";

// function App() {
//   return (
//     <ThemeProvider>
//       <ThemeSettings>
//         <AuthProvider>
//           {" "}
//           <Router />{" "}
//         </AuthProvider>
//       </ThemeSettings>
//     </ThemeProvider>
//   );
// }

// export default App;

// routes
import Router from "./routes";
// theme
import ThemeProvider from "./theme";
// components
import ThemeSettings from "./components/settings";
import { AuthProvider } from "./contexts/useAuth";
import { useEffect } from "react";
import socket from "./socket"; // ? Import shared socket
import { SocketProvider } from "./contexts/SocketProvider";
import { ChatProvider } from "./contexts/ChatContext";
import { CallProvider } from "./contexts/CallContext";
import { CallSocketProvider } from "./contexts/CallSocketProvider";

function App() {
  // useEffect(() => {
  //   const userId = parseInt(localStorage.getItem("userId"));
  //   if (userId) {
  //     socket.emit("register_user", userId);
  //     console.log("?? User registered to socket:", userId);
  //   }
  // }, []);

  return (
    <ThemeProvider>
      <ThemeSettings>
        <AuthProvider>
          <ChatProvider>
            <SocketProvider>
              <CallProvider>
                <CallSocketProvider>
                  <Router />
                </CallSocketProvider>
              </CallProvider>
            </SocketProvider>
          </ChatProvider>
        </AuthProvider>
      </ThemeSettings>
    </ThemeProvider>
  );
}

export default App;
