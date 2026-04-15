"use client";

type Candidate = {
    id: string | number;
    name: string;
    email: string;
    role: string;
    status: string;
};

type ReferredCandidatesPageProps = {
    candidates: Candidate[];
};

export default function ReferredCandidatesPage({
    candidates,
}: ReferredCandidatesPageProps) {
    return (
        <div className="bg-sky-50 p-6 rounded-2xl shadow-sm min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Referred Candidates</h2>
                <span className="text-sm text-gray-500">
                    Total: {candidates.length}
                </span>
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden">
                {candidates.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No referred candidates found
                    </div>
                ) : (
                    <div className="divide-y">
                        {candidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className="grid grid-cols-4 gap-4 p-4 hover:bg-gray-50 transition"
                            >
                                <div>
                                    <p className="text-xs text-gray-400">Name</p>
                                    <p className="font-medium">{candidate.name}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p>{candidate.email}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">Role</p>
                                    <p>{candidate.role}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400">Status</p>
                                    <p>{candidate.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
