import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

interface AlertDialogProps {
    open: boolean;
    title?: string;
    message: string;
    enMessage: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}


const ConfAlertDialog: React.FC<AlertDialogProps> = ({
    open,
    title = "錯誤 Error",
    message,
    onClose,
    enMessage,
    cancelText = "CLOSE",
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle className="dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText className="dialog-message">{message}<br></br>{enMessage}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className="dialog-button">
                    {cancelText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfAlertDialog;