import { Button } from "@mui/material";

const GiveSucessOrFail = () => {
    return (
        <div className="success">
            <img src="/images/success.png" alt="success" />
            <div>
                <p className="success-title">奉獻完成</p>
                <p className="success-title-english">Give Success</p>
            </div>
            <div>
                <p className="note-chinese">我們會將奉獻結果寄給您。請留意您的信箱</p>
                <p className="note-english">We will email you the result of giving. <br></br>Please check your email.</p>
            </div>
            <Button
                variant="contained"
                className="continue-button width100">
                Back to Home
            </Button>
        </div>
    );
};

export default GiveSucessOrFail;
