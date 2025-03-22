import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface UploadProps {
    receiptType: string;
    upload: boolean;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

const Upload: React.FC<UploadProps> = (props) => {
    const { upload, register, errors, receiptType } = props;

    return (
        <>
            {receiptType === "personal" && (
                <>
                    <FormControlLabel
                        className="checkbox-label-block"
                        control={
                            <Checkbox className="checkbox-custom" {...register("upload")} />
                        }
                        label={
                            <div className="label-custom">
                                <p className="label-chinese">需上傳國稅局 (台灣報稅需要)</p>
                                <p className="label-english">Need to submit taxes to Taiwan's IRS</p>
                            </div>
                        }
                        labelPlacement="end"
                    />

                    {upload && (
                        <div>
                            <p className="label-chinese">身分證字號</p>
                            <p className="label-english">National ID</p>
                            <TextField
                                id="outlined-required"
                                className="m-t-8 width100 basic-formControl"
                                {...register("nationalid", {
                                    required: upload && receiptType === "personal" ? "Required" : false,
                                })}
                                error={!!errors.nationalid}
                                helperText={
                                    typeof errors.nationalid?.message === "string"
                                        ? errors.nationalid?.message
                                        : undefined
                                }
                            />
                        </div>
                    )}
                </>
            )}
        </>

    );
};

export default Upload;