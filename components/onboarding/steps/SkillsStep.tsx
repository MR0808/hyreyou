'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { skillsSchema, type SkillsInput } from '@/schemas/onboarding';
import { saveSkills } from '@/actions/onboarding';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Plus, X, Code2 } from 'lucide-react';
import { SkillsStepProps } from '@/types/onboarding';

const SKILL_CATEGORIES = [
    'Technical',
    'Soft Skills',
    'Languages',
    'Tools',
    'Frameworks',
    'Databases'
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SkillsStep = ({ profile, onNext, onPrevious }: SkillsStepProps) => {
    const [isPending, startTransition] = useTransition();
    const [skills, setSkills] = useState<
        Array<{
            name: string;
            category: string;
            level?: string;
            yearsExp?: number;
        }>
    >(
        profile?.skills?.map((s: any) => ({
            name: s.skill.name,
            category: s.skill.category,
            level: s.level,
            yearsExp: s.yearsExp
        })) || []
    );
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillCategory, setNewSkillCategory] = useState('Technical');
    const [newSkillLevel, setNewSkillLevel] = useState<string>('');

    const form = useForm<SkillsInput>({
        resolver: zodResolver(skillsSchema),
        defaultValues: {
            skills: skills
        }
    });

    function handleAddSkill() {
        if (!newSkillName.trim()) {
            toast.error('Please enter a skill name');
            return;
        }

        const newSkill = {
            name: newSkillName.trim(),
            category: newSkillCategory,
            level: newSkillLevel || undefined
        };

        const updatedSkills = [...skills, newSkill];
        setSkills(updatedSkills);
        form.setValue('skills', updatedSkills);

        // Reset inputs
        setNewSkillName('');
        setNewSkillLevel('');
    }

    function handleRemoveSkill(index: number) {
        const updatedSkills = skills.filter((_, i) => i !== index);
        setSkills(updatedSkills);
        form.setValue('skills', updatedSkills);
    }

    function onSubmit(data: SkillsInput) {
        if (data.skills.length === 0) {
            toast.error('Please add at least one skill');
            return;
        }

        startTransition(async () => {
            const result = await saveSkills(data);

            if (result.success) {
                toast.success('Skills saved!');
                onNext();
            } else {
                toast.error(result.error || 'Failed to save skills');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Skills & Expertise
                </h2>
                <p className="text-slate-600 mt-1">
                    Add your technical and professional skills
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Add Skill Section */}
                    <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
                        <Label>Add a Skill</Label>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-5">
                                <Input
                                    placeholder="e.g., React, JavaScript, Project Management"
                                    value={newSkillName}
                                    onChange={(e) =>
                                        setNewSkillName(e.target.value)
                                    }
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                />
                            </div>
                            <div className="col-span-3">
                                <Select
                                    value={newSkillCategory}
                                    onValueChange={setNewSkillCategory}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SKILL_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-3">
                                <Select
                                    value={newSkillLevel}
                                    onValueChange={setNewSkillLevel}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Level (optional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SKILL_LEVELS.map((level) => (
                                            <SelectItem
                                                key={level}
                                                value={level}
                                            >
                                                {level}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-1">
                                <Button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="w-full"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Skills Display */}
                    {skills.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                            <Code2 className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                            <p className="text-slate-600 mb-2">
                                No skills added yet
                            </p>
                            <p className="text-sm text-slate-500">
                                Add your first skill using the form above
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {SKILL_CATEGORIES.map((category) => {
                                const categorySkills = skills.filter(
                                    (s) => s.category === category
                                );
                                if (categorySkills.length === 0) return null;

                                return (
                                    <div key={category} className="space-y-2">
                                        <h3 className="text-sm font-semibold text-slate-700">
                                            {category}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {categorySkills.map(
                                                (skill, index) => {
                                                    const globalIndex =
                                                        skills.findIndex(
                                                            (s) =>
                                                                s.name ===
                                                                    skill.name &&
                                                                s.category ===
                                                                    skill.category
                                                        );
                                                    return (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="px-3 py-1.5 text-sm bg-accent text-slate-800"
                                                        >
                                                            {skill.name}
                                                            {skill.level && (
                                                                <span className="ml-1.5 text-xs text-slate-500">
                                                                    (
                                                                    {
                                                                        skill.level
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveSkill(
                                                                        globalIndex
                                                                    )
                                                                }
                                                                className="ml-2 hover:text-red-600"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </Badge>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPrevious}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || skills.length === 0}
                        >
                            {isPending ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default SkillsStep;
