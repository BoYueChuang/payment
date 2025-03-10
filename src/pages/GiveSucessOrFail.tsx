import { Button } from "@mui/material";

const GiveSucessOrFail = ({ giveStatus }: { giveStatus: string }) => {
    return (
        <div className="success">
            {giveStatus === "fail" ? <img src="/images/fail.webp" alt="fail" /> : <img src="/images/success.webp" alt="success" />}
            <div>
                <p className="success-title">{giveStatus === "fail" ? "奉獻失敗" : "奉獻完成"}</p>
                <p className="success-title-english">{giveStatus === "fail" ? "Give Failed" : "Give Success"}</p>
            </div>
            <div>
                <p className="note-chinese">我們會將奉獻結果寄給您。請留意您的信箱</p>
                <p className="note-english">We will email you the result of giving. <br></br>Please check your email.</p>
            </div>
            <Button
                variant="contained"
                className="continue-button width100"
                onClick={() => {
                    if (giveStatus === "fail") {
                        window.location.href = "/CONFGIVE";
                    } else {
                        window.location.href = "/";
                    };
                }}>
                {giveStatus === "fail" ? "TRY AGAIN" : "BACK TO HOME"}
            </Button>
        </div>
    );
};

export default GiveSucessOrFail;
