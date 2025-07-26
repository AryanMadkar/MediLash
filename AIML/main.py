import sys
from typing import Dict, Any
from langgraph.graph import StateGraph, END
from utils.groq_client import GroqClient
from utils.conversation_logger import ConversationLogger
from agents.main_doctor import MainDoctor
from agents.cardiologist import Cardiologist
from agents.neurologist import Neurologist
from agents.dermatologist import Dermatologist
from agents.orthopedist import Orthopedist
from agents.endocrinologist import Endocrinologist

class MedicalAIBot:
    def __init__(self):
        # Initialize components
        try:
            self.groq_client = GroqClient()
            self.llm = self.groq_client.get_llm()
            self.logger = ConversationLogger()
            
            # Initialize all doctor agents
            self.main_doctor = MainDoctor(self.llm, self.logger)
            self.cardiologist = Cardiologist(self.llm, self.logger)
            self.neurologist = Neurologist(self.llm, self.logger)
            self.dermatologist = Dermatologist(self.llm, self.logger)
            self.orthopedist = Orthopedist(self.llm, self.logger)
            self.endocrinologist = Endocrinologist(self.llm, self.logger)
            
        except Exception as e:
            print(f"❌ Failed to initialize Medical AI Bot: {str(e)}")
            print("🔧 Run 'python start.py' to check system requirements")
            sys.exit(1)
    
    def run_consultation(self, first_input: str):
        """Run an interactive medical consultation with follow-up questions"""
        try:
            # Initialize conversation memory and state
            memory = []  # Stores full conversation for context
            state = {"question_count": 0}  # Tracks consultation state
            
            patient_input = first_input
            
            # Interactive consultation loop
            while True:
                # Main doctor processes input and either asks follow-up or triages
                result = self.main_doctor.ask_or_triage(patient_input, memory, state)
                
                # Check if patient has been triaged to specialist
                if result["triaged"]:
                    # Get specialist details
                    specialist_name = state["next_agent"]
                    clinical_summary = state["clinical_summary"]
                    
                    # Inform patient about specialist referral
                    referral_msg = f"Thank you for your patience. I'll now connect you with our {specialist_name.replace('_', ' ').title()}, who will provide specialized care for your condition."
                    self.logger.log_message(self.main_doctor.name, referral_msg)
                    print(f"\n🔄 {referral_msg}")
                    print("Please wait while I transfer your case...")
                    print("=" * 60)
                    
                    # Route to appropriate specialist
                    specialist_agents = {
                        "cardiologist": self.cardiologist,
                        "neurologist": self.neurologist,
                        "dermatologist": self.dermatologist,
                        "orthopedist": self.orthopedist,
                        "endocrinologist": self.endocrinologist
                    }
                    
                    # Get specialist consultation
                    specialist_agent = specialist_agents[specialist_name]
                    specialist_state = {
                        "consultation_request": clinical_summary,
                        "specialist_response": ""
                    }
                    
                    # Run specialist consultation
                    result_state = specialist_agent.consult(clinical_summary, specialist_state)
                    
                    # Provide final summary from main doctor
                    state["specialist_response"] = result_state["specialist_response"]
                    final_summary = self.main_doctor.provide_final_summary(state)
                    
                    # Save conversation log
                    self.logger.save_session()
                    
                    return {
                        "clinical_summary": clinical_summary,
                        "specialist_response": result_state["specialist_response"],
                        "final_summary": final_summary,
                        "specialist_consulted": specialist_name
                    }
                
                # Continue with follow-up questions
                follow_up_question = result["follow_up"]
                
                # Safety check for question limit
                if state.get("question_count", 0) >= self.main_doctor.MAX_QUESTIONS:
                    # Force final assessment
                    print(f"\n🩺 Dr. Chen: I have gathered sufficient information. Let me now determine the best specialist to help you.")
                    patient_input = "Please proceed with your assessment based on the information provided."
                    continue
                
                # Ask follow-up question to patient
                print(f"\n🩺 Dr. Chen: {follow_up_question}")
                patient_input = input("🤒 Patient: ").strip()
                
                if not patient_input:
                    patient_input = "No additional information to add."
                
                # Check for quit commands
                if patient_input.lower() in ['quit', 'exit', 'stop']:
                    print("\n👋 Consultation ended by patient. Please seek medical attention if needed.")
                    self.logger.save_session()
                    return {"status": "consultation_ended_by_patient"}
            
        except KeyboardInterrupt:
            print("\n\n⚠️ Consultation interrupted. Please seek medical attention if needed.")
            self.logger.save_session()
            return {"status": "consultation_interrupted"}
        except Exception as e:
            error_msg = f"Error during consultation: {str(e)}"
            self.logger.log_message("System", error_msg, "error")
            print(f"\n❌ {error_msg}")
            return {"error": error_msg}

def print_welcome():
    """Print welcome message"""
    print("\n" + "="*80)
    print("🏥 MEDICAL AI BOT - Interactive Doctor Consultation")
    print("="*80)
    print("🩺 Meet Your Medical Team:")
    print("   • Dr. Sarah Chen - Primary Care Physician (Will ask you questions)")
    print("   • Dr. Michael Rodriguez - Cardiologist (Heart & Cardiovascular)")
    print("   • Dr. David Kim - Neurologist (Brain & Nervous System)") 
    print("   • Dr. Maria Garcia - Dermatologist (Skin, Hair & Nails)")
    print("   • Dr. James Thompson - Orthopedist (Bones & Joints)")
    print("   • Dr. Lisa Patel - Endocrinologist (Hormones & Diabetes)")
    print("\n🔄 How it works:")
    print("   1. Describe your main symptom or concern")
    print("   2. Dr. Chen will ask you follow-up questions (like a real doctor)")
    print("   3. After gathering information, you'll be connected to a specialist")
    print("   4. The specialist will provide detailed assessment and recommendations")
    print("\n⚠️  IMPORTANT DISCLAIMER:")
    print("   This is an AI simulation for educational purposes only.")
    print("   Always consult real healthcare professionals for medical advice.")
    print("   In emergencies, call your local emergency services immediately.")
    print("="*80)

def main():
    print_welcome()
    
    # Initialize the bot
    print("\n🔧 Initializing Interactive Medical AI Bot...")
    bot = MedicalAIBot()
    print("✅ System ready for consultation!")
    
    while True:
        try:
            # Get initial patient input
            print("\n💬 Please describe your main health concern or symptoms:")
            print("   (Type 'quit' to exit, 'help' for guidance)")
            
            user_input = input("\n🤒 Patient: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Thank you for using Medical AI Bot. Stay healthy!")
                break
            
            if user_input.lower() == 'help':
                print("\n📋 How to get the best consultation:")
                print("   • Start with your main symptom (e.g., 'I have a headache')")
                print("   • Be ready to answer follow-up questions")
                print("   • Mention when symptoms started")
                print("   • Be honest about severity and other symptoms")
                print("   • Dr. Chen will guide you through the process")
                print("\n💡 Example: 'I have chest pain' - then answer her questions")
                continue
            
            if not user_input:
                print("⚠️  Please describe your symptoms to start the consultation.")
                continue
            
            # Start interactive consultation
            print("\n🩺 Starting your medical consultation with Dr. Sarah Chen...")
            print("🔍 She will ask you some questions to better understand your condition.")
            print("=" * 80)
            
            result = bot.run_consultation(user_input)
            
            if "error" in result:
                print(f"\n❌ {result['error']}")
            elif result.get("status") in ["consultation_ended_by_patient", "consultation_interrupted"]:
                print("\n📝 Partial consultation logged.")
            else:
                print("\n" + "="*80)
                print("✅ CONSULTATION COMPLETED!")
                print(f"🏥 Specialist Consulted: {result.get('specialist_consulted', 'N/A').replace('_', ' ').title()}")
                print("📝 Complete consultation saved to 'conversation_log.json'")
                print("="*80)
            
            # Ask if user wants another consultation
            print("\n🔄 Would you like to start a new consultation?")
            continue_consultation = input("   (y/n): ").strip().lower()
            if continue_consultation not in ['y', 'yes']:
                print("\n👋 Thank you for using Medical AI Bot. Stay healthy!")
                break
                
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye! Stay healthy!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {str(e)}")
            print("🔧 Please restart the application.")

if __name__ == "__main__":
    main()
