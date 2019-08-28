import initState from "../components/ReducersState";

const postReducer = (state = initState, action) => {
  switch (action.type) {
    case "PROTECTED":
      return action.data;
  }
  return state;
};
export default postReducer;
