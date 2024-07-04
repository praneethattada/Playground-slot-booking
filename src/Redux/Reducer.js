export const Reducer=(state={
    isloggedin : localStorage.getItem('token') ? true : false
},action)=>{
    switch(action.type){
        case "LOGIN":{
                      state={...state}
                      state.isloggedin=true
                      return state
                  }
        case "USER":{
            state={...state}
            state.user=action.payload
            return state
        }
        case "USERNAME":{
            state={...state}
            state.username=action.payload
            return state
        }
        case "PLAYGROUND":{
            state={...state}
            state.ground=action.payload
            return state
        }
        case "PLAYGROUNDIMAGES":{
            state={...state}
            state.image=action.payload
            return state
        }
        case "INDEX":{
            state={...state}
            state.index=action.payload
            return state
        }
        default :return state
    }}