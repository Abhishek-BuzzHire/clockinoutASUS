"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { template } from "@/lib/types/jobdata";
import { DEFAULT_CANDIDATE_FIELDS, TemplateField } from "@/lib/types/jobs";
import { GripVertical, Plus, X } from "lucide-react";
import { use, useEffect, useState } from "react";

const SingleEmailFormatPage = ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { toast } = useToast();
    const [selectedHRId, setSelectedHRId] = useState("");
    const [selectedFields, setSelectedFields] = useState<TemplateField[]>([]);
    const [customFieldLabel, setCustomFieldLabel] = useState("");
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const { id } = use(params);

    const numericId = Number(id);
    const data = template.find((t) => t.hrId === numericId);

    // useEffect(() => {
    //     if (selectedHRId) {
    //         if (data) {
    //             setSelectedFields(data.fields);
    //         } else {
    //             setSelectedFields([]);
    //         }
    //     }
    // }, [selectedHRId]);

    useEffect(() => {
        if (data) {
            setSelectedFields(data.fields);
        } else {
            setSelectedFields([]);
        }
    }, [data]);

    const generateSerial = (() => {
        let currentId = 100;
        return () => ++currentId;
    })();

    const toggleField = (field: Omit<TemplateField, 'id'>) => {
        const exists = selectedFields.find(f => f.key === field.key);
        if (exists) {
            setSelectedFields(selectedFields.filter(f => f.key !== field.key));
        } else {
            setSelectedFields([...selectedFields, { ...field, id: generateSerial() }]);
        }
    };

    const addCustomField = () => {
        if (!customFieldLabel.trim()) return;

        const customField: TemplateField = {
            id: generateSerial(),
            label: customFieldLabel,
            key: `custom_${generateSerial()}`,
            isCustom: true,
        };

        setSelectedFields([...selectedFields, customField]);
        setCustomFieldLabel('');
    };

    const removeField = (id: number) => {
        setSelectedFields(selectedFields.filter(f => f.id !== id));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFields = [...selectedFields];
        const draggedField = newFields[draggedIndex];
        newFields.splice(draggedIndex, 1);
        newFields.splice(index, 0, draggedField);

        setSelectedFields(newFields);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    if (!data) {
        return <div className="p-8">Client not found.</div>;
    }

    return (
        <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Email Template Builder</h2>

            <div className="space-y-6">
                {data && (
                    <>
                        <div>
                            <Label className="text-lg font-semibold mb-3 block">Available Fields</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {DEFAULT_CANDIDATE_FIELDS.map((field) => {
                                    const isSelected = selectedFields.some(f => f.key === field.key);
                                    return (
                                        <div key={field.key} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={field.key}
                                                checked={isSelected}
                                                onCheckedChange={() => toggleField(field)}
                                            />
                                            <Label htmlFor={field.key} className="cursor-pointer">
                                                {field.label}
                                            </Label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <Label className="text-lg font-semibold mb-3 block">Add Custom Field</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter custom field name (e.g., Reason for Job Change)"
                                    value={customFieldLabel}
                                    onChange={(e) => setCustomFieldLabel(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCustomField()}
                                />
                                <Button onClick={addCustomField} variant="secondary">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {selectedFields.length > 0 && (
                            <div>
                                <Label className="text-lg font-semibold mb-3 block">
                                    Field Order (Drag to reorder)
                                </Label>
                                <div className="space-y-2">
                                    {selectedFields.map((field, index) => (
                                        <div
                                            key={field.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className="flex items-center gap-2 p-3 bg-muted rounded-md cursor-move hover:bg-gray-300 transition-colors"
                                        >
                                            <GripVertical className="w-5 h-5 text-muted-foreground" />
                                            <span className="flex-1 font-medium">{field.label}</span>
                                            {field.isCustom && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                                    Custom
                                                </span>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeField(field.id)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Card>
    )
}

export default SingleEmailFormatPage