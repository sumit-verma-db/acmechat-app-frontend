// import { createSlice } from "@reduxjs/toolkit";
// import { dispatch } from "../store";

// // define initial state
// const initialState = {
//     sidebar:{
//         open:false,
//         type: "CONTACT",// can be CONTACT, STARRED,SHARED
//     }
// }

// // create slice
// const slice = createSlice({
//     name:'app',
//     initialState,
//     reducers:{
//         //Toggle sidebar
//         toggleSidebar(state,action){
//             state.sidebar.open = !state.sidebar.open
//         },
//         updateSidebarType(state, action){
//             state.sidebar.type = action.payload.type;
//         }
//     }
// });

// // export reducer
// export default slice.reducer;

// //thunk functions - perform async operations
// export function ToggleSidebar (){
//     return async () =>{
//         dispatch(slice.actions.toggleSidebar());
//     }
// }

// export function UpdateSidebarType (type){
//     return async () =>{
//         dispatch(slice.actions.updateSidebarType({
//             type
//         }))
//     }
// }

import { createSlice } from "@reduxjs/toolkit";

// Define initial state
const initialState = {
  sidebar: {
    open: false,
    type: "STARRED", // can be CONTACT, STARRED, SHARED
  },
};

// Create slice
const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Toggle sidebar
    toggleSidebar(state) {
      state.sidebar.open = !state.sidebar.open;
    },
    updateSidebarType(state, action) {
      state.sidebar.type = action.payload.type;
    },
  },
});

// ✅ Export actions directly from the slice
export const { toggleSidebar, updateSidebarType } = slice.actions;

// ✅ Export reducer
export default slice.reducer;

// ✅ Thunk functions using passed dispatch
export function ToggleSidebar() {
  return (dispatch) => {
    dispatch(toggleSidebar());
  };
}

export function UpdateSidebarType(type) {
  return (dispatch) => {
    dispatch(updateSidebarType({ type }));
  };
}
