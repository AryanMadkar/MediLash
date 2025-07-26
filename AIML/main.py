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
            
            # Create the workflow graph
            self.workflow = self.create_workflow()
            
        except Exception as e:
            print(f"❌ Failed to initialize Medical AI Bot: {str(e)}")
            print("🔧 Run 'python start.py' to check system requirements")
            sys.exit(1)
    
    def create_workflow(self):
        """Create the LangGraph workflow"""
        
        # Define the state schema
        class State(Dict[str, Any]):
            patient_input: str
            main_doctor_assessment: str
            specialist_response: str
            consultation_request: str
            next_agent: str
            final_summary: str
        
        # Define node functions
        def main_doctor_node(state: State) -> State:
            return self.main_doctor.process_patient_input(state["patient_input"], state)
        
        def cardiologist_node(state: State) -> State:
            return self.cardiologist.consult(state["consultation_request"], state)
        
        def neurologist_node(state: State) -> State:
            return self.neurologist.consult(state["consultation_request"], state)
        
        def dermatologist_node(state: State) -> State:
            return self.dermatologist.consult(state["consultation_request"], state)
        
        def orthopedist_node(state: State) -> State:
            return self.orthopedist.consult(state["consultation_request"], state)
        
        def endocrinologist_node(state: State) -> State:
            return self.endocrinologist.consult(state["consultation_request"], state)
        
        def main_doctor_summary_node(state: State) -> State:
            final_summary = self.main_doctor.provide_final_summary(state)
            state["final_summary"] = final_summary
            state["next_agent"] = "end"
            return state
        
        # Routing function
        def route_to_specialist(state: State) -> str:
            next_agent = state.get("next_agent", "end")
            if next_agent == "end":
                return END
            return next_agent
        
        # Build the graph
        workflow = StateGraph(State)
        
        # Add nodes
        workflow.add_node("main_doctor", main_doctor_node)
        workflow.add_node("cardiologist", cardiologist_node)
        workflow.add_node("neurologist", neurologist_node)
        workflow.add_node("dermatologist", dermatologist_node)
        workflow.add_node("orthopedist", orthopedist_node)
        workflow.add_node("endocrinologist", endocrinologist_node)
        workflow.add_node("main_doctor_summary", main_doctor_summary_node)
        
        # Set entry point
        workflow.set_entry_point("main_doctor")
        
        # Add conditional edges from main doctor to specialists
        workflow.add_conditional_edges(
            "main_doctor",
            route_to_specialist,
            {
                "cardiologist": "cardiologist",
                "neurologist": "neurologist", 
                "dermatologist": "dermatologist",
                "orthopedist": "orthopedist",
                "endocrinologist": "endocrinologist",
                END: END
            }
        )
        
        # Add edges from specialists back to main doctor summary
        for specialist in ["cardiologist", "neurologist", "dermatologist", "orthopedist", "endocrinologist"]:
            workflow.add_edge(specialist, "main_doctor_summary")
        
        # End after summary
        workflow.add_edge("main_doctor_summary", END)
        
        return workflow.compile()
    
    def run_consultation(self, patient_input: str):
        """Run a medical consultation"""
        try:
            # Initialize state
            initial_state = {
                "patient_input": patient_input,
                "main_doctor_assessment": "",
                "specialist_response": "",
                "consultation_request": "",
                "next_agent": "",
                "final_summary": ""
            }
            
            # Run the workflow
            result = self.workflow.invoke(initial_state)
            
            # Save conversation
            self.logger.save_session()
            
            return result
            
        except Exception as e:
            error_msg = f"Error during consultation: {str(e)}"
            self.logger.log_message("System", error_msg, "error")
            return {"error": error_msg}

def print_welcome():
    """Print welcome message"""
    print("\n" + "="*80)
    print("🏥 MEDICAL AI BOT - Multi-Agent Doctor Simulation")
    print("="*80)
    print("🩺 Available Specialists:")
    print("   • Dr. Sarah Chen - Primary Care Physician (Supervisor)")
    print("   • Dr. Michael Rodriguez - Cardiologist")
    print("   • Dr. David Kim - Neurologist") 
    print("   • Dr. Maria Garcia - Dermatologist")
    print("   • Dr. James Thompson - Orthopedist")
    print("   • Dr. Lisa Patel - Endocrinologist")
    print("\n⚠️  IMPORTANT DISCLAIMER:")
    print("   This is an AI simulation for educational purposes only.")
    print("   Always consult real healthcare professionals for medical advice.")
    print("   In emergencies, call your local emergency services immediately.")
    print("="*80)

def main():
    print_welcome()
    
    # Initialize the bot
    print("\n🔧 Initializing Medical AI Bot...")
    bot = MedicalAIBot()
    print("✅ System ready!")
    
    while True:
        try:
            # Get patient input
            print("\n💬 Describe your symptoms or health concerns:")
            print("   (Type 'quit' to exit, 'help' for guidance)")
            
            user_input = input("\n🤒 Patient: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                print("\n👋 Thank you for using Medical AI Bot. Stay healthy!")
                break
            
            if user_input.lower() == 'help':
                print("\n📋 How to use:")
                print("   • Describe your symptoms in detail")
                print("   • Mention when symptoms started")
                print("   • Include relevant medical history")
                print("   • Be specific about pain location, severity, etc.")
                print("\n💡 Example: 'I have chest pain that started 2 hours ago, along with shortness of breath'")
                continue
            
            if not user_input:
                print("⚠️  Please describe your symptoms.")
                continue
            
            # Run consultation
            print("\n🔍 Starting medical consultation...")
            print("=" * 80)
            
            result = bot.run_consultation(user_input)
            
            if "error" in result:
                print(f"\n❌ {result['error']}")
            else:
                print("\n✅ Consultation completed!")
                print("📝 Full conversation has been logged to 'conversation_log.json'")
            
            # Ask if user wants another consultation
            print("\n" + "=" * 80)
            continue_consultation = input("\n🔄 Would you like another consultation? (y/n): ").strip().lower()
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
