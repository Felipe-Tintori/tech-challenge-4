import { useState } from "react";
import { typeSnackbar } from "../enum/snackBar";

export function useSnackBar() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<typeSnackbar>(typeSnackbar.SUCCESS); // ou seu enum/type

  function showSnackBar(msg: string, snackType: typeSnackbar) {
    setMessage(msg);
    setType(snackType);
    setVisible(true);
  }

  function hideSnackBar() {
    setVisible(false);
  }

  return {
    visible,
    message,
    type,
    showSnackBar,
    hideSnackBar,
  };
}
