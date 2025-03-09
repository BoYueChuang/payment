import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from "@mui/material";

interface AlertDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
}

const ConfDialog: React.FC<AlertDialogProps> = ({
    open,
    title = "錯誤",
    message,
    onClose,
    cancelText = "關閉",
}) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle className="dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText className="dialog-message">{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} className="dialog-button">
                    {cancelText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfDialog;