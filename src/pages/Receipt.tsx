import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface ReceiptProps {
    setReceiptType: React.Dispatch<React.SetStateAction<string>>;
    receiptType: string;
    receipt: boolean;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

const Receipt: React.FC<ReceiptProps> = (props) => {
    const { receipt, register, errors, setReceiptType, receiptType } = props;

    return (
        <>
            <div className="receipt-name-block">
                <FormControlLabel
                    className="checkbox-label-block"
                    {...register("receipt")}
                    control={
                        <Checkbox className="checkbox-custom" />
                    }
                    label={<div className="label-custom">
                        <p className="label-chinese">需開立年度奉獻收據？</p>
                        <p className="label-english">Annual giving receipt needed</p></div>}
                    labelPlacement="end"
                />
                {receipt && (
                    <>
                        <div>
                            <Button onClick={() => setReceiptType('personal')}
                                className={`personal-company-button ${receiptType === "personal" ? "clicked" : "not-clicked"}`}
                            >個人</Button>
                            <Button onClick={() => setReceiptType('company')} className={`personal-company-button ${receiptType === "company" ? "clicked" : "not-clicked"}`}>企業</Button>
                        </div>
                        {receiptType === "personal" && (
                            <div>
                                <p className="label-chinese">收據姓名</p>
                                <p className="label-english">Receipt Name</p>
                                <TextField
                                    id="outlined-required"
                                    className="receiptName width100 basic-formControl"
                                    {...register("receiptName", {
                                        required: receiptType === "personal" ? "Required" : false,
                                    })}
                                    error={!!errors.receiptName}
                                    helperText={typeof errors.receiptName?.message === 'string' ? errors.receiptName?.message : undefined}
                                />
                                <p className="contact-information-note">如有報稅需求，請填寫與台灣身分證相符的姓名</p>
                            </div>
                        )}
                    </>
                )
                }
            </div>
            {
                receipt && receiptType === "company" && (
                    <div className="company-tax-block">
                        <div>
                            <p className="label-chinese">企業登記全名</p>
                            <p className="label-english">Company's Registered Name</p>
                            <TextField
                                id="outlined-required"
                                className="receiptName width100 basic-formControl"
                                {...register("company", {
                                    // 當 getPaymentType === "company" 時，才需要驗證
                                    required: receiptType === "company" ? "Required" : false,
                                })}
                                error={!!errors.company}
                                helperText={typeof errors.company?.message === 'string' ? errors.company?.message : undefined}
                            />
                        </div>
                        <div>
                            <p className="label-chinese">統一編號</p>
                            <p className="label-english">Tax ID Number</p>
                            <TextField
                                id="outlined-required"
                                className="m-t-8 width100 basic-formControl"
                                {...register("taxid", {
                                    // 當 getPaymentType === "company" 時，才需要驗證
                                    required: receiptType === "company" ? "Required" : false,
                                })}
                                error={!!errors.taxid}
                                helperText={typeof errors.taxid?.message === 'string' ? errors.taxid?.message : undefined}
                            />
                        </div>
                    </div>
                )
            }
        </>
    )
};

export default Receipt