import { Button } from "@mui/material";

const GiveSucessOrFail = ({ giveStatus }: { giveStatus: string }) => {
    return (
        <div className="success">
            {giveStatus === "fail" ? <img src="/images/fail.webp" alt="fail" /> : <img src="/images/success.webp" alt="success" />}
            <div>
                <p className="success-title">{giveStatus === "fail" ? "奉獻失敗" : "奉獻完成"}</p>
                <p className="success-title-english">{giveStatus === "fail" ? "FAILED" : "SUCCESS!"}</p>
            </div>
            <div>
                {giveStatus === "fail" ?
                    <>
                        <p className="note-chinese">
                            謝謝你的慷慨奉獻，與我們一起建造這個家！<br></br>我們注意到這筆奉獻「未成功授權」，請與您的銀行/信用卡確認授權，或更換支付方式。<br></br>如有疑問請來信
                            <a href="mailto:give@thehope.co" onClick={(e) => {
                                e.preventDefault();
                                window.open("https://mail.google.com/mail/?view=cm&to=give@thehope.co", "_blank");
                            }}>give@thehope.co</a>，我們樂意協助！
                        </p>
                        <p className="note-english">
                            Thank you for your generosity in building this home with us!<br></br>
                            We will email your giving record to you within a week. If you have any questions, please feel free to contact us at
                            <a href="mailto:give@thehope.co" onClick={(e) => {
                                e.preventDefault();
                                window.open("https://mail.google.com/mail/?view=cm&to=give@thehope.co", "_blank");
                            }}>give@thehope.co</a>
                        </p>
                    </>
                    :
                    <>
                        <p className="note-chinese">
                            謝謝你的慷慨奉獻，與我們一起建造這個家！<br></br>我們會在一週內將奉獻結果 email 到您的信箱。如有任何疑問，請來信 <a href="mailto:give@thehope.co">give@thehope.co</a>
                        </p>
                        <p className="note-english">
                            Thank you for your generosity in building this home with us!<br></br>
                            We will email your giving record to you within a week. If you have any questions, please feel free to contact us at <a href="mailto:give@thehope.co">give@thehope.co</a>
                        </p>
                    </>
                }
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
