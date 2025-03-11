import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { FieldErrors, UseFormRegister } from "react-hook-form";

interface UploadProps {
    upload: boolean;
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

const Upload: React.FC<UploadProps> = (props) => {
    const { upload, register, errors } = props;

    return (
        <>
            <FormControlLabel
                className="checkbox-label-block"
                control={
                    <Checkbox className="checkbox-custom"
                        {...register("upload")} />
                }
                label={<div className="label-custom">
                    <p className="label-chinese">是否上傳國稅局？(台灣報稅需要)</p>
                    <p className="label-english">Do you need to submit your taxes to Taiwan's IRS?</p></div>}
                labelPlacement="start"
            />
            {upload && (
                <div>
                    <p className="label-chinese">身分證字號</p>
                    <p className="label-english">National ID</p>
                    <TextField
                        id="outlined-required"
                        className="nationalID width100 basic-formControl"
                        {...register("nationalid", {
                            // 當 upload === "true" 時，才需要驗證
                            required: upload ? "身分證字號必填" : false,
                        })}
                        error={!!errors.nationalid}
                        helperText={typeof errors.nationalid?.message === 'string' ? errors.nationalid?.message : undefined}
                    />
                </div>
            )}
        </>
    );
};

export default Upload;