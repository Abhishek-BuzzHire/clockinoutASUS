import React, { useRef, useState} from 'react';
import { Upload } from 'lucide-react';
import { uploadAndParseResume } from '@/utils/apiService';
import { Button } from '../ui/button';
import { Candidate } from '@/lib/types';

interface ResumeUploadProps {
    onParsedData: (data: Candidate) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onParsedData }) => {
    const [text, setText] = useState('Upload CV')
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        console.log('file Uploaded')
        setText('Parsing data & filling up form...')
        try {
            const parsedData = await uploadAndParseResume(file);
            onParsedData(parsedData);
            setText('Successfully Done!')
        } catch (error) {
            console.error('Error Uploading file', error);
            alert('Failed to upload and parse resume. Try again')
        }
    }

    const handleCvButton = () => {
        fileInputRef.current?.click();
    }

    return (
        <div className='flex justify-center'>
            <label htmlFor='resume-upload'></label>
            <input
                type='file'
                accept='.pdf, .doc, .docx'
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{display: 'none'}}
            />

            <Button size='lg' variant="default"  type='button' onClick={handleCvButton}>{text}</Button>
        </div>
    )
}

export default ResumeUpload;