"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import Container from "@/components/shared/container";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelTextArea } from "@/components/ui/floating-label-textarea";
import { FormSubmitButton } from "@/components/ui/form-submit-button";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  mobile: string;
}

export default function ContactForm() {
  const t = useTranslations("ContactForm");

  const [formData, setFormData] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    message: "",
    mobile: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement form submission logic
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        message: "",
        mobile: "",
      });
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="w-full rounded-md bg-white p-5 md:p-10">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FloatingLabelInput
              inputProps={{
                name: "firstName",
                onChange: handleChange,
                required: true,
                type: "text",
                value: formData.firstName,
              }}
              label={t("firstName")}
            />
            <FloatingLabelInput
              inputProps={{
                name: "lastName",
                onChange: handleChange,
                required: true,
                type: "text",
                value: formData.lastName,
              }}
              label={t("lastName")}
            />
          </div>

          <FloatingLabelInput
            inputProps={{
              name: "email",
              onChange: handleChange,
              required: true,
              type: "email",
              value: formData.email,
            }}
            label={t("email")}
          />

          <FloatingLabelInput
            inputProps={{
              name: "mobile",
              onChange: handleChange,
              required: true,
              type: "tel",
              value: formData.mobile,
            }}
            label={t("mobile")}
          />

          <FloatingLabelTextArea
            label={t("message")}
            textareaProps={{
              name: "message",
              onChange: handleChange,
              placeholder: t("messagePlaceholder"),
              required: true,
              rows: 6,
              value: formData.message,
            }}
          />

          <FormSubmitButton className="w-full" isSubmitting={isSubmitting}>
            {t("submitButton")}
          </FormSubmitButton>
        </form>
      </div>
    </Container>
  );
}
