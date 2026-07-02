declare namespace ClassroomsAPI {
	type ClassInfo = {
		id: string;
		name: string;
		description?: string;
		inviteCode: string;
		teacherId: string;
		createdAt: string;
		members: ClassMember[];
		assignments: ClassAssignment[];
	};

	type ClassMember = {
		id: string;
		classId: string;
		userId?: string;
		studentName: string;
		studentCode: string;
		status: 'PENDING' | 'APPROVED' | 'REJECTED';
		joinedAt?: string;
		classDetails?: ClassInfo;
	};

	type ClassAssignment = {
		id: string;
		classId: string;
		title: string;
		description?: string;
		simulationId: string;
		dueDate?: string;
		createdAt: string;
		submissions?: AssignmentSubmission[];
	};

	type AssignmentSubmission = {
		id: string;
		assignmentId: string;
		memberId: string;
		score?: number;
		status: 'SUBMITTED' | 'GRADED';
		submittedAt: string;
	};

	type CreateClassDto = {
		name: string;
		description?: string;
	};

	type JoinClassDto = {
		inviteCode: string;
		studentName: string;
		studentCode: string;
	};

	type CreateAssignmentDto = {
		title: string;
		description?: string;
		simulationId: string;
		dueDate?: string;
	};

	type SubmitAssignmentDto = {
		memberId: string;
		score: number;
	};
}
