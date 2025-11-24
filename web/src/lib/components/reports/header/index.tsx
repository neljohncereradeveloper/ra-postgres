import React from "react";
import Image from "next/image";
import { ClipboardList, Filter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CSharedReportHeaderProps {
  title: string;
}

const CSharedReportHeader = ({ title }: CSharedReportHeaderProps) => {
  return (
    <>
      <div className="mb-6 text-center flex flex-col items-center print:flex">
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              AGDAO MULTIPURPOSE COOPERATIVE
            </h1>
            <div className="text-sm text-gray-600 space-y-0.5 text-center flex flex-col items-center">
              <p>AMPC Head Office Bldg., N. Torres & P. Urduja Sts.</p>
              <p>Paciano Bangoy, 8000 Davao City</p>
              <div className="flex items-center justify-center gap-2">
                <span>Tel: (082) 285-3797</span>
                <span className="h-1 w-1 bg-gray-400 rounded-full" />
                <span>Fax: Local 210/211</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg">
            <ClipboardList className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default CSharedReportHeader;
