import { createContext, useContext } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const value = {
    initdata: "query_id=AAERwXNFAAAAABHBc0UgOSi4&user=%7B%22id%22%3A1165213969%2C%22first_name%22%3A%22Inayat%22%2C%22last_name%22%3A%22Hussain%22%2C%22username%22%3A%22itsinayat%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FiUHZ1sh1sknoFZhs4q0_ghxTbhp20EoHjiMZgn5MiTQ.svg%22%7D&auth_date=1764934564&signature=R6FLJWohPA6ILOgd_jwIS6f49c5-1CscTrwOdRA1KHVybwVxiAbOlg29OuDgZ2TGTmw1yH2UFn-mvFhZ4EWBBQ&hash=6434e5b626665428b22333d3116a0c63cb65878ccd59e6045f4bdaa7fdebda4a"
  };



  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);