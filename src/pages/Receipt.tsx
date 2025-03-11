import { Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface ReceiptProps {
    receipt: boolean;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

const Receipt: React.FC<ReceiptProps> = (props) => {
    const { receipt, register, errors } = props;
    const [getPaymentType, setPaymentType] = useState("personal");

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
                        <p className="label-chinese">是否需開立年度奉獻收據？</p>
                        <p className="label-english">Do you need annual giving receipt？</p></div>}
                    labelPlacement="start"
                />
                {receipt && (
                    <>
                        <div>
                            <Button onClick={() => setPaymentType("personal")}
                                className={`personal-company-button ${getPaymentType === "personal" ? "clicked" : "not-clicked"}`}
                            >個人</Button>
                            <Button onClick={() => setPaymentType("company")} className={`personal-company-button ${getPaymentType === "company" ? "clicked" : "not-clicked"}`}>企業</Button>
                        </div>
                        {getPaymentType === "personal" && (
                            <div>
                                <p className="label-chinese">收據姓名</p>
                                <p className="label-english">Receipt Name</p>
                                <TextField
                                    id="outlined-required"
                                    className="receiptName width100 basic-formControl"
                                    {...register("receiptName", {
                                        // 當 getPaymentType === "personal" 時，才需要驗證

                                        required: getPaymentType === "personal" ? "姓名必填" : false,
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
                receipt && getPaymentType === "company" && (
                    <div className="company-tax-block">
                        <div>
                            <p className="label-chinese">企業登記全名</p>
                            <p className="label-english">Company's Registered Name</p>
                            <TextField
                                id="outlined-required"
                                className="receiptName width100 basic-formControl"
                                {...register("company", {
                                    // 當 getPaymentType === "company" 時，才需要驗證
                                    required: getPaymentType === "company" ? "企業登記全名必填" : false,
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
                                className="nationalID width100 basic-formControl"
                                {...register("taxid", {
                                    // 當 getPaymentType === "company" 時，才需要驗證
                                    required: getPaymentType === "company" ? "統一編號必填" : false,
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