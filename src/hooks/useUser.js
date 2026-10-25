import { useContext } from 'react'
import UserContext from '../components/UserContext'

function useUser() {
  return useContext(UserContext)
}

export default useUser