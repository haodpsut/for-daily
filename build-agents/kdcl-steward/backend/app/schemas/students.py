from __future__ import annotations

from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class StudentCreate(BaseModel):
    program_id: str
    code: str = Field(..., min_length=1, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=255)
    date_of_birth: date | None = None
    cohort_code: str | None = None
    email: str | None = None


class StudentUpdate(BaseModel):
    full_name: str | None = None
    date_of_birth: date | None = None
    cohort_code: str | None = None
    email: str | None = None


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    program_id: str
    code: str
    full_name: str
    date_of_birth: date | None
    cohort_code: str | None
    email: str | None


class SessionStudentLink(BaseModel):
    student_id: str
    absent: bool = False
    notes: str | None = None
