import React from "react";
import { BiSolidUpArrow } from "react-icons/bi";
import { useAnonAadhaar, useProver } from "@anon-aadhaar/react";
import { upvotePetition } from "../../services/petitionService";
import { toast } from "sonner";

const PetitionCard = ({ petition, getRelativeTimeString }) => {
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  const handleUpvote = async () => {
    if (anonAadhaar?.status !== "logged-in") {
      toast.error("Please login with Anon Aadhaar to upvote");
      return;
    }

    try {
      if (!latestProof) {
        toast.error("No proof found. Please try logging in again.");
        return;
      }

      const nullifier = latestProof.proof.nullifier;
      const userPincode = latestProof.claim.pincode;

      // toast.info("Verifying upvote...", {
      //   description: `Pincode: ${userPincode}`,
      // });

      if (!nullifier || !userPincode) {
        toast.error(
          "Could not get verification data. Please try logging in again."
        );
        return;
      }

      const result = await upvotePetition(
        petition.id,
        nullifier,
        userPincode,
        petition.pincode
      );

      toast.success("Petition upvoted successfully!");
      window.location.reload();
    } catch (error) {
      toast.error(error.message || "Failed to upvote petition");
    }
  };

  return (
    <div className="min-w-[40vw] flex justify-between border gap-5 border-gray-200 rounded-sm p-4 hover:bg-gray-50 relative">
      <span className="absolute top-2 right-2 text-xs text-gray-500">
        {getRelativeTimeString(petition.inserted_at)}
      </span>
      <div className="flex flex-col pt-2 pb-1">
        <h2 className="text-lg font-medium mb-1">{petition.title}</h2>
        <p className="text-sm text-gray-500 mb-2">{petition.description}</p>
        <div className="flex gap-2 text-xs text-gray-800 pt-2">
          <span className="bg-gray-200 px-3 py-1 rounded-full">
            {petition.state}
          </span>
          <span className="bg-gray-200 px-2 py-1 rounded-full">
            {petition.location}
          </span>
          <span className="bg-gray-200 px-2 py-1 rounded-full">
            PIN: {petition.pincode}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-center text-sm">
        <button
          onClick={handleUpvote}
          disabled={anonAadhaar?.status !== "logged-in"}
          className={`flex flex-col items-center justify-center rounded-sm px-3 py-1 border ${
            anonAadhaar?.status === "logged-in"
              ? "border-orange-400 text-orange-400 hover:bg-orange-100"
              : "border-gray-300 text-gray-400 cursor-not-allowed"
          } transition-colors`}
        >
          <BiSolidUpArrow />
          {petition.supporters || 0}
        </button>
      </div>
    </div>
  );
};

export default PetitionCard;
