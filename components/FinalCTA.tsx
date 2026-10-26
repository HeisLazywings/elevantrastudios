import StrategyCTA from "@/components/strategy/StrategyCTA";

export default function FinalCTA() {
  return (
    <StrategyCTA
      title="Tell us what you’re trying to achieve."
      description="We’ll begin by understanding what’s in the way, whether the problem fits our capabilities and what a sensible next step could be."
      label="Discuss your business"
      secondary={{ href: "/approach", label: "How we approach the work" }}
    />
  );
}
